import axios from 'axios';
import type { UserRow } from '../types/user';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const SHEET_NAME = import.meta.env.VITE_SHEET_NAME || 'planilha_user';

interface GoogleSheetsResponse {
    values: string[][];
}

class GoogleSheetsService {
    private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

    /**
     * Busca todos os usuários da planilha
     */
    async getUsers(): Promise<UserRow[]> {
        try {
            const range = `${SHEET_NAME}!A:C`;
            const url = `${this.baseUrl}/${SHEET_ID}/values/${range}?key=${API_KEY}`;

            const response = await axios.get<GoogleSheetsResponse>(url);

            if (!response.data.values || response.data.values.length === 0) {
                return [];
            }

            // Remove o header (primeira linha)
            const [, ...rows] = response.data.values;

            // Mapeia as linhas para objetos UserRow
            return rows.map((row) => ({
                Usuario: row[0] || '',
                Email: row[1] || '',
                Senha: row[2] || '',
            }));
        } catch (error) {
            console.error('Error fetching users from Google Sheets:', error);
            throw new Error('Falha ao buscar usuários. Verifique a configuração da API.');
        }
    }

    /**
     * Valida credenciais de login
     */
    async validateCredentials(email: string, password: string): Promise<UserRow | null> {
        try {
            const users = await this.getUsers();

            const user = users.find(
                (u) => u.Email.toLowerCase() === email.toLowerCase() && u.Senha === password
            );

            return user || null;
        } catch (error) {
            console.error('Error validating credentials:', error);
            throw error;
        }
    }

    /**
     * Busca usuário por email
     */
    async getUserByEmail(email: string): Promise<UserRow | null> {
        try {
            const users = await this.getUsers();
            return users.find((u) => u.Email.toLowerCase() === email.toLowerCase()) || null;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    }
}

export const googleSheetsService = new GoogleSheetsService();
