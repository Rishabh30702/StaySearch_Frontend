import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/Core/Services/AuthService/services/AuthInterceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "/Language/", ".json"); // ✅ Ensures correct translation path
}

// ✅ Updated Config with TranslateModule properly configured
const updatedConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAnimations(),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    ...(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }) as any).providers, // ✅ Ensures TranslateModule providers are included
  ],
};

bootstrapApplication(AppComponent, updatedConfig)
  .catch((err) => console.error(err));
