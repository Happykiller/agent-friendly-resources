import { Container } from "inversify";
import type { DbAdapter } from "./adapters/db/db.abstract.js";
import { JsonDbAdapter } from "./adapters/db/db.json.js";
import { JsonQualifyToolRepository } from "./adapters/db/qualify-tool.repository.json.js";
import type { QualifyToolRepository } from "./usecases/domains/qualify-tool/qualify-tool.repository.js";
import { QualifyTaxProfileUseCase } from "./usecases/domains/qualify-tool/qualify-tax-profile.usecase.js";
import { ListSupportingDocumentsUseCase } from "./usecases/domains/qualify-tool/list-supporting-documents.usecase.js";
import { DetectReviewPointsUseCase } from "./usecases/domains/qualify-tool/detect-review-points.usecase.js";
import { BuildPreDeclarationUseCase } from "./usecases/domains/qualify-tool/build-pre-declaration.usecase.js";

export const TYPES = {
  DbAdapter: Symbol.for("DbAdapter"),
  QualifyToolRepository: Symbol.for("QualifyToolRepository"),
  QualifyTaxProfileUseCase: Symbol.for("QualifyTaxProfileUseCase"),
  ListSupportingDocumentsUseCase: Symbol.for("ListSupportingDocumentsUseCase"),
  DetectReviewPointsUseCase: Symbol.for("DetectReviewPointsUseCase"),
  BuildPreDeclarationUseCase: Symbol.for("BuildPreDeclarationUseCase"),
};

const container = new Container();

container.bind<DbAdapter>(TYPES.DbAdapter).toDynamicValue(() => new JsonDbAdapter()).inSingletonScope();

container
  .bind<QualifyToolRepository>(TYPES.QualifyToolRepository)
  .toDynamicValue((context) => {
    const dbAdapter = context.get<DbAdapter>(TYPES.DbAdapter);
    return new JsonQualifyToolRepository(dbAdapter);
  })
  .inSingletonScope();

container
  .bind<QualifyTaxProfileUseCase>(TYPES.QualifyTaxProfileUseCase)
  .toDynamicValue((context) => {
    const repository = context.get<QualifyToolRepository>(TYPES.QualifyToolRepository);
    return new QualifyTaxProfileUseCase(repository);
  })
  .inSingletonScope();

container
  .bind<ListSupportingDocumentsUseCase>(TYPES.ListSupportingDocumentsUseCase)
  .toDynamicValue((context) => {
    const qualifyUseCase = context.get<QualifyTaxProfileUseCase>(TYPES.QualifyTaxProfileUseCase);
    const repository = context.get<QualifyToolRepository>(TYPES.QualifyToolRepository);
    return new ListSupportingDocumentsUseCase(qualifyUseCase, repository);
  })
  .inSingletonScope();

container
  .bind<DetectReviewPointsUseCase>(TYPES.DetectReviewPointsUseCase)
  .toDynamicValue((context) => {
    const qualifyUseCase = context.get<QualifyTaxProfileUseCase>(TYPES.QualifyTaxProfileUseCase);
    const repository = context.get<QualifyToolRepository>(TYPES.QualifyToolRepository);
    return new DetectReviewPointsUseCase(qualifyUseCase, repository);
  })
  .inSingletonScope();

container
  .bind<BuildPreDeclarationUseCase>(TYPES.BuildPreDeclarationUseCase)
  .toDynamicValue((context) => {
    const qualifyUseCase = context.get<QualifyTaxProfileUseCase>(TYPES.QualifyTaxProfileUseCase);
    const repository = context.get<QualifyToolRepository>(TYPES.QualifyToolRepository);
    return new BuildPreDeclarationUseCase(qualifyUseCase, repository);
  })
  .inSingletonScope();

export { container };
