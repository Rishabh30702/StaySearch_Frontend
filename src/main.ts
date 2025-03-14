import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

// ✅ Merge provideAnimations() into appConfig
const updatedConfig = {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideAnimations()]
};

bootstrapApplication(AppComponent, updatedConfig)
  .catch((err) => console.error(err));
