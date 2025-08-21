export interface FlowiseMessage {
  question: string;
  uploads?: Array<{
    data: string;
    type: string;
    name: string;
    mime: string;
  }>;
}

export interface FlowiseResponse {
  text: string;
  sourceDocuments?: any[];
  followUpPrompts?: string[];
}

export async function sendToFlowise(
  message: string, 
  apiUrl: string, 
  apiKey: string, 
  uploads?: any[]
): Promise<FlowiseResponse> {
  try {
    const payload: FlowiseMessage = {
      question: message,
    };

    if (uploads && uploads.length > 0) {
      payload.uploads = uploads;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      text: data.text || data.message || 'No response from AI assistant',
      sourceDocuments: data.sourceDocuments,
      followUpPrompts: data.followUpPrompts,
    };
  } catch (error) {
    console.error('Error calling Flowise API:', error);
    throw new Error('Failed to get response from AI assistant');
  }
}
