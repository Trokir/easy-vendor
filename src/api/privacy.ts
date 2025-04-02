import express, { Router } from 'express';
import { validateEmail } from '../utils/validation';
import { 
  PrivacySettings, 
  CCPAOptOutRequest, 
  CCPAOptOutResponse,
  PrivacySettingsResponse,
  PrivacySettingsError 
} from '../types/privacy';
import { GeoLocationService } from '../services/geoLocation.service';

const router: Router = express.Router();

// Middleware для обработки ошибок
const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Privacy API Error:', err);
  const error: PrivacySettingsError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An internal server error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  };
  res.status(500).json(error);
};

// Middleware для валидации email
const validateEmailMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    const error: PrivacySettingsError = {
      code: 'INVALID_EMAIL',
      message: 'Please provide a valid email address',
    };
    return res.status(400).json(error);
  }
  next();
};

// GET /api/privacy-settings
router.get('/', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const isCaliforniaUser = await GeoLocationService.isCaliforniaUser();
    
    // В реальном приложении здесь будет получение настроек из базы данных
    const settings: PrivacySettings = {
      doNotSell: false,
      email: '',
      lastUpdated: new Date().toISOString(),
    };

    const response: PrivacySettingsResponse = {
      settings,
      isCaliforniaUser,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/privacy-settings
router.put('/', validateEmailMiddleware, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, doNotSell } = req.body;

    // В реальном приложении здесь будет обновление настроек в базе данных
    const settings: PrivacySettings = {
      doNotSell,
      email,
      lastUpdated: new Date().toISOString(),
    };

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// POST /api/privacy-settings/ccpa-opt-out
router.post('/ccpa-opt-out', validateEmailMiddleware, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email, doNotSell } = req.body as CCPAOptOutRequest;

    // Проверяем, является ли пользователь жителем Калифорнии
    const isCaliforniaUser = await GeoLocationService.isCaliforniaUser();
    if (!isCaliforniaUser) {
      const error: PrivacySettingsError = {
        code: 'NOT_CALIFORNIA_USER',
        message: 'CCPA opt-out is only available for California residents',
      };
      return res.status(403).json(error);
    }

    // В реальном приложении здесь будет сохранение opt-out в базе данных
    const response: CCPAOptOutResponse = {
      success: true,
      message: 'Successfully opted out of data sales',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router; 