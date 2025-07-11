import axios from "axios";

/**
 * Service to interact with the auth net service.
 */
export class AuthService {

  private cachedMeResponses: {[key: string]: {
    expires: number;
    user: IPublicUser;
  }} = {};

  /**
   * Default Auth net service URL.
   */
  static readonly AUTH_URL_DEFAULT: string = 'https://auth.thefirstspine.fr'

  /**
   * Validates a JWT to the auth platform service.
   * @param jwt The JWT to send to the auth net service
   */
  async me(jwt: string): Promise<number|null> {
    const user = await this.meFull(jwt);
    if (user == null) {
      return null;
    }
    return user.user_id;
  }

  /**
   * Validates a JWT to the auth platform service.
   * @param jwt The JWT to send to the auth net service
   */
  async meFull(jwt: string): Promise<IPublicUser|null> {
    // Get cached response
    if (this.cachedMeResponses[jwt] != undefined && (new Date()).getTime() < this.cachedMeResponses[jwt].expires) {
      return this.cachedMeResponses[jwt].user;
    }

    // Check the bearer JSON token
    try {
      const response = await axios.get(this.getAuthNetServiceUrl() + '/api/v3/me', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      const jsonResponse = response.data;
      if (!jsonResponse.user_id) {
        return null;
      }

      // Cache the response
      this.cachedMeResponses[jwt] = {
        expires: (new Date()).getTime() + (60 * 1000), // one minute
        user: jsonResponse,
      };
  
      // Return the user
      return this.cachedMeResponses[jwt].user;
    } catch(e) {
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

/**
 * Public user entity.
 */
export interface IPublicUser {
  user_id: number;
  is_guest: boolean;
  email: string;
  meta: { [key: string]: string | number | boolean | null };
}
