// meta.service.ts
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(private meta: Meta, private title: Title) {}

  updateMetaTags(config: {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    robots?: string;
  }) {
    if (config.title) {
      this.title.setTitle(config.title);
      this.meta.updateTag({ name: 'title', content: config.title });
      this.meta.updateTag({ property: 'og:title', content: config.title });
    }

    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
      this.meta.updateTag({ property: 'og:description', content: config.description });
    }

    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    if (config.author) {
      this.meta.updateTag({ name: 'author', content: config.author });
    }

    if (config.robots) {
      this.meta.updateTag({ name: 'robots', content: config.robots });
    }
  }
}