/**
 * Supabase Edge Function: verify-domains-cron
 * 
 * This function runs periodically (via cron job) to automatically verify
 * DNS configuration for pending domains.
 * 
 * Setup:
 * 1. Deploy this function to Supabase
 * 2. Set up a cron job to call it every 1 minute:
 *    - Use GitHub Actions, or
 *    - Use external cron service (cron-job.org, etc.)
 * 
 * Endpoint: https://your-project.supabase.co/functions/v1/verify-domains-cron
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface DomainRecord {
  id: string;
  user_id: string;
  domain: string;
  cname_target: string;
  verification_token: string;
  is_verified: boolean;
  created_at: string;
}

interface DNSResponse {
  Status: number;
  Answer?: Array<{
    name: string;
    type: number;
    TTL: number;
    data: string;
  }>;
}

/**
 * Verify DNS CNAME record using Cloudflare DNS over HTTPS
 */
async function verifyDNS(domain: string, expectedTarget: string): Promise<boolean> {
  try {
    // Use Cloudflare DNS over HTTPS
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${domain}&type=CNAME`,
      {
        headers: {
          'accept': 'application/dns-json'
        }
      }
    );

    if (!response.ok) {
      console.log(`DNS query failed for ${domain}: ${response.status}`);
      return false;
    }

    const data: DNSResponse = await response.json();

    // Check if we got a CNAME record
    if (!data.Answer || data.Answer.length === 0) {
      console.log(`No DNS records found for ${domain}`);
      return false;
    }

    // Find CNAME record (type 5)
    const cnameRecord = data.Answer.find(record => record.type === 5);

    if (!cnameRecord) {
      console.log(`No CNAME record found for ${domain}`);
      return false;
    }

    // Normalize the target (remove trailing dot if present)
    const actualTarget = cnameRecord.data.replace(/\.$/, '');
    const normalizedExpected = expectedTarget.replace(/\.$/, '');

    const isValid = actualTarget === normalizedExpected;

    console.log(`DNS verification for ${domain}:`, {
      expected: normalizedExpected,
      actual: actualTarget,
      valid: isValid
    });

    return isValid;

  } catch (error) {
    console.error(`Error verifying DNS for ${domain}:`, error);
    return false;
  }
}

/**
 * Send notification to user (optional)
 */
async function notifyUser(userId: string, domain: string, supabase: any) {
  try {
    // Insert notification into notifications table
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'domain_verified',
        title: 'Domínio Ativo!',
        message: `Seu domínio ${domain} foi verificado e está ativo.`,
        read: false
      });

    console.log(`Notification sent to user ${userId} for domain ${domain}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get all unverified domains from the last 7 days
    const { data: domains, error: fetchError } = await supabase
      .from('user_domains')
      .select('*')
      .eq('is_verified', false)
      .eq('auto_verify_enabled', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    if (!domains || domains.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No domains to verify',
          checked: 0
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking ${domains.length} unverified domains...`);

    const results = {
      checked: domains.length,
      verified: 0,
      failed: 0,
      details: [] as any[]
    };

    // Check each domain
    for (const domain of domains as DomainRecord[]) {
      try {
        console.log(`Verifying ${domain.domain}...`);

        const isValid = await verifyDNS(domain.domain, domain.cname_target);

        if (isValid) {
          // Update domain as verified
          const { error: updateError } = await supabase
            .from('user_domains')
            .update({
              is_verified: true,
              ssl_status: 'active',
              last_verified_at: new Date().toISOString()
            })
            .eq('id', domain.id);

          if (updateError) {
            console.error(`Error updating domain ${domain.domain}:`, updateError);
            results.failed++;
            results.details.push({
              domain: domain.domain,
              status: 'update_failed',
              error: updateError.message
            });
          } else {
            console.log(`✅ Domain verified: ${domain.domain}`);
            results.verified++;
            results.details.push({
              domain: domain.domain,
              status: 'verified'
            });

            // Send notification to user
            await notifyUser(domain.user_id, domain.domain, supabase);
          }
        } else {
          console.log(`❌ DNS not configured yet: ${domain.domain}`);
          results.details.push({
            domain: domain.domain,
            status: 'pending'
          });
        }

      } catch (error) {
        console.error(`Error processing domain ${domain.domain}:`, error);
        results.failed++;
        results.details.push({
          domain: domain.domain,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('Verification complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * GitHub Actions Workflow Example:
 * 
 * .github/workflows/verify-domains.yml
 * 
 * name: Verify Domains
 * on:
 *   schedule:
 *     - cron: '* * * * *'  # Every minute
 * 
 * jobs:
 *   verify:
 *     runs-on: ubuntu-latest
 *     steps:
 *       - name: Call verification endpoint
 *         run: |
 *           curl -X POST \
 *             -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
 *             https://your-project.supabase.co/functions/v1/verify-domains-cron
 */
