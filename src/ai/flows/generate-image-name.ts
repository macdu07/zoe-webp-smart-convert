// use server'
'use server';

/**
 * @fileOverview Generates a descriptive filename for an image using AI.
 *
 * - generateImageName - A function that generates a descriptive filename for an image.
 * - GenerateImageNameInput - The input type for the generateImageName function.
 * - GenerateImageNameOutput - The return type for the generateImageName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageNameInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .enum(['spanish', 'english'])
    .default('spanish')
    .describe('The language for generating the descriptive filename.')
});
export type GenerateImageNameInput = z.infer<typeof GenerateImageNameInputSchema>;

const GenerateImageNameOutputSchema = z.object({
  filename: z.string().describe('A descriptive filename for the image, lowercase, and hyphenated.'),
});
export type GenerateImageNameOutput = z.infer<typeof GenerateImageNameOutputSchema>;

export async function generateImageName(input: GenerateImageNameInput): Promise<GenerateImageNameOutput> {
  return generateImageNameFlow(input);
}

const generateImageNamePrompt = ai.definePrompt({
  name: 'generateImageNamePrompt',
  input: {schema: GenerateImageNameInputSchema},
  output: {schema: GenerateImageNameOutputSchema},
  prompt: `You are an expert in generating descriptive filenames for images.

  Given the content of the image, generate a descriptive filename that is lowercase and hyphenated.

  Language: {{language}}

  Instructions:
  - If language is "spanish": Generate the filename in Spanish. For example, if the image contains a plant in a white pot on a table, the filename should be "planta-en-maceta-blanca-sobre-mesa".
  - If language is "english": Generate the filename in English. For example, if the image contains a plant in a white pot on a table, the filename should be "plant-in-white-pot-on-table".

  Image: {{media url=photoDataUri}}`,
});

const generateImageNameFlow = ai.defineFlow(
  {
    name: 'generateImageNameFlow',
    inputSchema: GenerateImageNameInputSchema,
    outputSchema: GenerateImageNameOutputSchema,
  },
  async input => {
    const {output} = await generateImageNamePrompt(input);
    return output!;
  }
);
