// src/ai/ai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIApi, Configuration } from 'openai';
import { Course } from '../courses/entities/course.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private openai: OpenAIApi;

    constructor(private configService: ConfigService) {
        const configuration = new Configuration({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
        this.openai = new OpenAIApi(configuration);
    }

    async generateCourseRecommendations(user: User, courses: Course[]): Promise<any> {
        try {
            const prompt = this.buildRecommendationPrompt(user, courses);
            const response = await this.openai.createCompletion({
                model: 'text-davinci-003',
                prompt,
                max_tokens: 150,
                temperature: 0.7,
            });

            return {
                recommendations: response.data.choices[0].text.trim(),
                generatedAt: new Date(),
            };
        } catch (error) {
            this.logger.error('Failed to generate AI recommendations', error.stack);
            return this.getFallbackRecommendations();
        }
    }

    private buildRecommendationPrompt(user: User, courses: Course[]): string {
        const pastCourses = user.enrollments
            ?.filter(e => e.status === 'completed')
            .map(e => e.course.title)
            .join(', ');

        return `As an academic advisor, suggest courses for ${user.firstName} ${user.lastName}, a ${user.role} with these completed courses: ${pastCourses}. 
    Available courses: ${courses.map(c => c.title).join(', ')}. 
    Provide 3 recommendations with brief explanations:`;
    }

    private getFallbackRecommendations() {
        return {
            recommendations: [
                'Intro to Computer Science - Based on your interest in technology',
                'Calculus I - Required for your degree program',
                'Academic Writing - Helps develop essential communication skills',
            ],
            generatedAt: new Date(),
            isFallback: true,
        };
    }
}