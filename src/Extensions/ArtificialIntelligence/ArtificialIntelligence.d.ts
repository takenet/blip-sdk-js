export declare interface IArtificialIntelligence {

    // Analysis

    getAnalysis(skip?: number, take?: number, ascending?: boolean, filter?: string, intents?: string[], feedbacks?: string[],
        source?: string, beginDate?: string, endDate?: string, minScore?: string, maxScore?: string);
    analyse(emailAndFilter: object);
    setAnalysisByEmail(emailAndFilter: object, intents?: string[], feedbacks?: string[],
        source?: string, beginDate?: string, endDate?: string, minScore?: string, maxScore?: string);
    setAnalysisFeedback(id: string, analysisFeedback: object);
    setAnalysesFeedback(analyses: object[]);

    // Analytics (Confusion Matrix)

    getAnalytics(id?: string);
    setAnalytics(confusionMatrix: object);
    deleteAnalytics(id: string);

    // Intents

    getIntent(id: string, deep?: boolean);
    getIntents(skip?: number, take?: number, deep?: boolean, name?: string, ascending?: boolean);
    setIntent(intent: object);
    setIntents(intents: object[]);
    mergeIntent(intent: object);
    mergeIntents(intents: object[]);
    deleteIntent(id: string);
    deleteIntents();

    // Answers

    getIntentAnswers(id?: string, skip?: number, take?: number, ascending?: boolean);
    setIntentAnswers(id: string, answers: object[]);
    deleteIntentAnswer(id: string, answerId: string);

    // Questions

    getIntentQuestions(id: string);
    setIntentQuestions(id: string, questions: object[]);
    deleteIntentQuestion(id: string, questionId: string);

    // Entity

    getEntity(id: string);
    getEntities(skip?: number, take?: number, ascending?: boolean, name?: string);
    setEntity(entity: object);
    deleteEntity(id: string);
    deleteEntities();

    // Model

    getModel(id: string);
    getModels(skip?: number, take?: number, ascending?: boolean);
    getModelSummary();
    getLastTrainedOrPublishedModel();
    trainModel();
    publishModel(id: string);

    // Word Set

    getWordSet(id: string, deep?: boolean);
    getWordSets(deep?: boolean);
    setWordSetResource(id: string, resource: object[]);
    setWordSet(wordSet: object);
    deleteWordSet(id: string);
    analyseWordSet(analysis: object);

}
