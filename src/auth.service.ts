import axios from "axios";

/**
 * Service to interact with the auth net service.
 */
export class AuthService {

  /**
   * Default Auth net service URL.
   */
  static readonly AUTH_URL_DEFAULT: string = 'https://auth.thefirstspine.fr'

  /**
   * Validates a JWT to the auth platform service.
   * @param jwt The JWT to send to the auth net service
   */
  async me(jwt: string): Promise<number|null> {
    // Check the bearer JSON token
    try {
      const response = await axios.get(this.getAuthNetServiceUrl() + '/api/v2/me', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const jsonResponse = response.data;
      if (!jsonResponse.user_id) {
        return null;
      }
  
      // Return the user ID
      return jsonResponse.user_id;
    } catch(e) {
      console.log({ errorFromAxios: e });
      return null;
    }

    return null;
  }

  /**
   * Get the auth net service URL according to the AUTH_URL environment variable.
   */
  public getAuthNetServiceUrl(): string {
    return process.env?.AUTH_URL?.length > 0 ? process.env.AUTH_URL : AuthService.AUTH_URL_DEFAULT;
  }

}

export default new AuthService();
