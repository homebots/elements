import { Injectable } from '@homebots/elements';

@Injectable({
  providedBy: 'root'
})
export class NameGenerationService {
  getRandomName() {
    return 'Le Random Smith #' + Math.round(Math.random() * 999);
  }
}
