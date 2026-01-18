import { Router } from 'express';

const router: Router = Router()

/* Test route */
router.get("/", (_req, res) => {
  res.status(200).json({
    msg: "API Working",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

export default router;