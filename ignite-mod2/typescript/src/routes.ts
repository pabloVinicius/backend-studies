import { Request, Response } from 'express';
import CreateCourseService from './CreateCourseService';

export function createCourse(request: Request, response: Response) {

  CreateCourseService.execute({name: 'Node', duration: 10, educator: undefined});

  return response.send('test1');
}