import axios from 'axios';
import type { UserRow } from '../types/user';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const SHEET_NAME = import.meta.env.VITE_SHEET_NAME || 'planilha_user';

interface GoogleSheetsResponse {
    values: string[][];
}

class GoogleSheetsService {
    private accessToken: string | null = null;

    /**
     * Define o access token do Google OAuth2
     */
    setAccessToken(token: string) {
        this.accessToken = token;
    }

    /**
     * Busca todos os usuários da planilha usando OAuth2
     */
    async getUsers(): Promise<UserRow[]> {
        if (!this.accessToken) {
            throw new Error('Access token não configurado. Faça login com Google primeiro.');
        }

        try {
            const range = `${SHEET_NAME}!A:C`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`;

            const response = await axios.get<GoogleSheetsResponse>(url, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            });

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
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                throw new Error('Sem permissão para acessar a planilha. Verifique as permissões.');
            }
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
