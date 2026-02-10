/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * @swagger
 * /terms:
 *   get:
 *     summary: Get terms and conditions
 *     description: Retrieves terms and conditions in the specified language.
 *     tags:
 *       - Terms
 *     operationId: getTerms
 *     parameters:
 *       - name: language
 *         in: query
 *         required: false
 *         description: Language code for terms localization
 *         schema:
 *           type: string
 *           enum: [de-DE, en-US]
 *           example: en-US
 *     responses:
 *       200:
 *         description: Terms content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - item
 *               properties:
 *                 item:
 *                   type: object
 *                   required:
 *                     - type
 *                     - language
 *                     - content
 *                     - signature
 *                   properties:
 *                     language:
 *                       type: string
 *                       enum: [de-DE, en-US]
 *                       description: Language code used
 *                       example: en-US
 *                     content:
 *                       type: string
 *                       description: Markdown content of the terms
 *                       example: Your privacy is important to us...
 *                     signature:
 *                       type: string
 *                       description: Signature hash of terms
 *                       example: 940226c4c41f51afe3980ceb63704e752636526f4c52a4ea579e85b247493d94
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *     security: []
 */

module.exports = {
  inputs: {
    language: {
      type: 'string',
      isIn: User.LANGUAGES,
    },
  },

  async fn(inputs) {
    const terms = await sails.hooks.terms.getPayload(inputs.language);

    return {
      item: terms,
    };
  },
};
