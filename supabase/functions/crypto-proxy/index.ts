import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COINCAP_BASE_URL = 'https://api.coincap.io/v2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint } = await req.json();
    
    if (!endpoint) {
      throw new Error('endpoint is required');
    }

    console.log(`Proxying request to CoinCap: ${endpoint}`);

    const response = await fetch(`${COINCAP_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinCap API error (${response.status}):`, errorText);
      throw new Error(`CoinCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
