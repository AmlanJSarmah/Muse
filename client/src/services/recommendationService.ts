import axios from 'axios';
import type { MyRecommendationInfoResponse, RecommendationResponse } from '../types/api';

const mlClient = axios.create({
    baseURL: import.meta.env.VITE_ML_API_URL || 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
});

export async function getRecommendations(movieInfo: MyRecommendationInfoResponse): Promise<RecommendationResponse> {
    try {
        const { data } = await mlClient.post<RecommendationResponse>('/recommend', movieInfo);
        return data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
            const data = error.response.data as { detail?: string; error?: string };
            throw new Error(data.error || data.detail || 'Unable to get recommendations from the model.', { cause: error });
        }
        throw new Error('Unable to connect to the MUSE recommendation model.', { cause: error });
    }
}
