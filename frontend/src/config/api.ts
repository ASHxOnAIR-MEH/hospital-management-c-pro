/**
 * Centralized API Configuration
 * 
 * The Google Apps Script Web App URL is defined here in one place.
 * Do NOT hard-code this URL throughout the application.
 * 
 * When deploying to Google Apps Script:
 * 1. Deploy your Apps Script project as a Web App (Access: Anyone).
 * 2. Paste the Web App URL below:
 *    export const API_BASE_URL = "https://script.google.com/macros/s/AKfycb.../exec";
 * 
 * For local testing and development:
 * "/api" routes directly to the local database engine backed by sheets-database/csv.
 */

export const API_BASE_URL = "/api";

export const ERROR_MESSAGES = {
  UNABLE_TO_CONNECT: "Unable to connect to the hospital database. Please check your connection and try again."
};
