import * as UriTemplates from './UriTemplates';
import * as ContentTypes from './ContentTypes';
import * as Lime from 'lime-js';
import ExtensionBase from '../ExtensionBase';

const POSTMASTER_AI = 'postmaster@ai.msging.net';

export default class ArtificialIntelligenceExtension extends ExtensionBase {

    constructor(client, to = null) {
        super(client);
        this._to = to ? to : POSTMASTER_AI;
    }

    // Analysis

    getAnalysis(skip = 0, take = 100, ascending = false, filter = '', intents = [], feedbacks = [], source = '', beginDate = '', endDate = '', minScore = '', maxScore = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.ANALYSIS, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    $filter: filter,
                    intents,
                    feedbacks,
                    source,
                    beginDate,
                    endDate,
                    minScore,
                    maxScore
                }),
                this._to));
    }

    analyse(analysis) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSIS, ContentTypes.ANALYSIS, analysis, this._to));
    }

    setAnalysisByEmail(emailAndFilter, intents = [], feedbacks = [], source = '', beginDate = '', endDate = '', minScore = '', maxScore = '') {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSIS_EMAIL, ContentTypes.JSON_DOCUMENT, {
                email: emailAndFilter.email,
                filter: this._buildResourceQuery(UriTemplates.ANALYSIS, {
                    $filter: emailAndFilter.filter,
                    intents,
                    feedbacks,
                    source,
                    beginDate,
                    endDate,
                    minScore,
                    maxScore
                })
            }, this._to));
    }

    setAnalysisFeedback(id, analysisFeedback) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.ANALYSIS_FEEDBACK, id),
                ContentTypes.ANALYSIS_FEEDBACK, analysisFeedback, this._to));
    }

    setAnalysesFeedback(analyses) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSES_FEEDBACK, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.ANALYSIS_FEEDBACK,
                items: analyses
            }, this._to));
    }

    // Analytics (Confusion Matrix)

    getAnalytics(id = null) {
        const uri = id ? this._buildUri(UriTemplates.ANALYTICS_ID, id) : UriTemplates.ANALYTICS;
        return this._processCommand(this._createGetCommand(uri, this._to));
    }

    setAnalytics(confusionMatrix) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYTICS, ContentTypes.CONFUSION_MATRIX, confusionMatrix, this._to));
    }

    deleteAnalytics(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.ANALYTICS_ID, id), this._to));
    }

    // Intents

    getIntent(id, deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.INTENTION, id), {
                        deep: deep
                    }), this._to));
    }

    getIntents(skip = 0, take = 100, deep = false, name = '', ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.INTENTIONS, {
                    $skip: skip,
                    $take: take,
                    deep: deep,
                    name: name,
                    $ascending: ascending
                }), this._to));
    }

    setIntent(intent) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.INTENTIONS, ContentTypes.INTENTION, intent, this._to));
    }

    setIntents(intents) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.INTENTIONS, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.INTENTION,
                items: intents
            }, this._to));
    }

    mergeIntent(intent) {
        return this._processCommand(
            this._createMergeCommand(UriTemplates.INTENTIONS, ContentTypes.INTENTION, intent, this._to));
    }

    mergeIntents(intents) {
        return this._processCommand(
            this._createMergeCommand(UriTemplates.INTENTIONS, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.INTENTION,
                items: intents
            }, this._to));
    }

    deleteIntent(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.INTENTION, id), this._to));
    }

    deleteIntents() {
        return this._processCommand(
            this._createDeleteCommand(UriTemplates.INTENTIONS, this._to));
    }

    // Intents Answers

    getIntentAnswers(id, skip = 0, take = 100, ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.INTENTION_ANSWERS, id), {
                        $skip: skip,
                        $take: take,
                        $ascending: ascending
                    }), this._to));
    }

    setIntentAnswers(id, answers) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.INTENTION_ANSWERS, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.ANSWER,
                    items: answers
                }, this._to));
    }

    deleteIntentAnswer(id, answerId) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.INTENTION_ANSWER, id, answerId), this._to));
    }

    // Intents Questions

    getIntentQuestions(id) {
        return this._processCommand(
            this._createGetCommand(this._buildUri(UriTemplates.INTENTION_QUESTIONS, id), this._to));
    }

    setIntentQuestions(id, questions) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.INTENTION_QUESTIONS, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.QUESTION,
                    items: questions
                }, this._to));
    }

    deleteIntentQuestion(id, questionId) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.INTENTION_QUESTION, id, questionId), this._to));
    }

    // Entity

    getEntity(id) {
        return this._processCommand(
            this._createGetCommand(this._buildUri(UriTemplates.ENTITY, id), this._to));
    }

    getEntities(skip = 0, take = 100, ascending = false, name = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.ENTITIES, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    name: name
                }), this._to));
    }

    setEntity(entity) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ENTITIES, ContentTypes.ENTITY, entity, this._to));
    }

    deleteEntity(id) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.ENTITY, id), this._to));
    }

    deleteEntities() {
        return this._processCommand(
            this._createDeleteCommand(UriTemplates.ENTITIES, this._to));
    }

    // Model

    getModels(skip = 0, take = 100, ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.MODELS, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending
                }),
                this._to));
    }

    getModel(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.MODEL, id), this._to));
    }

    getModelSummary() {
        return this._processCommand(
            this._createGetCommand(UriTemplates.MODELS_SUMMARY, this._to));
    }

    getLastTrainedOrPublishedModel() {
        return this._processCommand(
            this._createGetCommand(UriTemplates.LAST_TRAINED_OR_PUBLISH_MODEL, this._to));
    }

    trainModel() {
        return this._processCommand(
            this._createSetCommand(UriTemplates.MODELS, ContentTypes.MODEL_TRAINING, {}, this._to));
    }

    publishModel(id) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.MODELS, ContentTypes.MODEL_PUBLISHING, {
                id: id
            }, this._to));
    }

    // Word Set

    getWordSet(id, deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.WORD_SET, id), {
                        deep: deep
                    }), this._to));
    }

    getWordSets(deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.WORD_SETS, {
                    deep: deep
                }), this._to));
    }

    setWordSetResource(id, resource) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.WORD_SET, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.WORD_SET_WORD,
                    items: resource
                }, this._to));
    }

    setWordSet(wordSet) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.WORD_SETS, ContentTypes.WORD_SET, wordSet, this._to));
    }

    deleteWordSet(id) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.WORD_SET, id), this._to));
    }

    analyseWordSet(analysis) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.WORD_SETS_ANALYSIS, ContentTypes.WORD_SETS_ANALYSIS, analysis, this._to));
    }

    //Content Assistant

    getContents(skip = 0, take = 100) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.CONTENTS, {
                    $skip: skip,
                    $take: take
                }), this._to));
    }

    getContent(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id), this._to));
    }

    setContent(content) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.CONTENT, ContentTypes.CONTENT_RESULT, content, this._to));
    }

    deleteContent(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id), this._to));
    }
}
