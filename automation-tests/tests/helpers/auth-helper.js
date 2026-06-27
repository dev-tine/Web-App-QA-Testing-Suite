import { expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export const baseURL = process.env.AVIIHAI_BASE_URL;

export async function loginAsDemoUser(page) {
  await page.goto(baseURL);

  await page.getByPlaceholder('officer@aviihai.com').fill(process.env.AVIIHAI_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.AVIIHAI_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByText(/hello, officer/i)).toBeVisible({ timeout: 15000 });
}