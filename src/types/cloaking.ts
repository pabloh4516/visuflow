export interface CloakingConfig {
  id: string;
  user_id: string;
  name: string;
  redirect_url: string;
  use_separate_urls: boolean;
  redirect_url_desktop: string | null;
  redirect_url_mobile: string | null;
  bot_action: 'fake_page' | 'redirect' | 'block';
  fake_page_template: number;
  fake_page_html: string | null;
  bot_redirect_url: string | null;
  safe_redirect_url: string | null;
  block_known_bots: boolean;
  block_data_centers: boolean;
  slug: string | null;
  short_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CloakingFormData {
  name: string;
  redirect_url: string;
  use_separate_urls: boolean;
  redirect_url_desktop: string;
  redirect_url_mobile: string;
  bot_action: 'fake_page' | 'redirect' | 'block';
  fake_page_template: number;
  fake_page_html: string;
  bot_redirect_url: string;
  safe_redirect_url: string;
  block_known_bots: boolean;
  block_data_centers: boolean;
  slug: string;
}

export const defaultCloakingFormData: CloakingFormData = {
  name: '',
  redirect_url: '',
  use_separate_urls: false,
  redirect_url_desktop: '',
  redirect_url_mobile: '',
  bot_action: 'fake_page',
  fake_page_template: 1,
  fake_page_html: '',
  bot_redirect_url: '',
  safe_redirect_url: '',
  block_known_bots: true,
  block_data_centers: true,
  slug: '',
};
