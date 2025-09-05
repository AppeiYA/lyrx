import express from 'express';
import { type Router} from 'express';
import songController from '../songController';

const songRouter: Router = express.Router()

songRouter.get("/topSongs", songController.topSongs)
songRouter.get("/search", songController.songSearch)
songRouter.get("/track/:id", songController.getSong)

export default songRouter;