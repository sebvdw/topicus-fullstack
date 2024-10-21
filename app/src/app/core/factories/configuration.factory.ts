import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { Configuration, ConfigurationParameters } from '../api/v1';
@Injectable({
  providedIn: 'root',
})
export class ConfigurationFactory {
  createConfiguration(): Configuration {
    const configParams: ConfigurationParameters = {
      basePath: environment.apiUrl,
      credentials: {
        //get the bearer token from the store
        bearerAuth: localStorage.getItem('authToken') || '',
      },
    };
    return new Configuration(configParams);
  }
}
