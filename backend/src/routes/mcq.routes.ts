import { Router } from 'express';
import { mcqController } from '../controllers/mcq.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/generate-topic', (req, res) => mcqController.generateFromTopic(req, res));
router.post('/generate-url', (req, res) => mcqController.generateFromURL(req, res));
router.post('/generate-file', upload.single('file'), (req, res) => mcqController.generateFromFile(req, res));

export default router;
