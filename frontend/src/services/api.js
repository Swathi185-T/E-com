/**
 * API Service for communicating with the Python Flask Backend
 */

const API_BASE = '/api';

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error('Backend service is unreachable');
  return response.json();
}

export async function predictCategory(productName, description) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_name: productName,
      description: description
    })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to predict category');
  }
  return data;
}

export async function getDashboard() {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
}

export async function getHistory(search = '', category = '', limit = 100, offset = 0) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category !== 'all') params.append('category', category);
  params.append('limit', limit);
  params.append('offset', offset);

  const response = await fetch(`${API_BASE}/history?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch prediction history');
  return response.json();
}

export async function deleteHistoryItem(id) {
  const response = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete history item');
  return response.json();
}

export async function clearAllHistory() {
  const response = await fetch(`${API_BASE}/history`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to clear prediction history');
  return response.json();
}

export async function getModelPerformance() {
  const response = await fetch(`${API_BASE}/model-performance`);
  if (!response.ok) throw new Error('Failed to fetch model evaluation metrics');
  return response.json();
}
