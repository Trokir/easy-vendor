// Файл перенаправления на основную версию из src/services/email.service.ts
// Для обеспечения обратной совместимости

import { EmailService } from '../email.service';
export { EmailService };
export type { EmailTemplateData } from '../email.service';
export { getEmailSubject } from '../email.service';
