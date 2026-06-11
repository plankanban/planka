import { CardRelationKinds } from '../constants/Enums';

export const invertCardRelationKind = (kind) => {
  switch (kind) {
    case CardRelationKinds.PARENTOF:
      return CardRelationKinds.CHILDOF;
    case CardRelationKinds.CHILDOF:
      return CardRelationKinds.PARENTOF;
    case CardRelationKinds.BLOCKS:
      return CardRelationKinds.BLOCKEDBY;
    case CardRelationKinds.BLOCKEDBY:
      return CardRelationKinds.BLOCKS;
    default:
      return kind;
  }
};

export const getAllCardRelationKinds = () => [
  { key: 'RELATED', value: CardRelationKinds.RELATED },
  { key: 'PARENTOF', value: CardRelationKinds.PARENTOF },
  { key: 'CHILDOF', value: CardRelationKinds.CHILDOF },
  { key: 'BLOCKS', value: CardRelationKinds.BLOCKS },
  { key: 'BLOCKEDBY', value: CardRelationKinds.BLOCKEDBY },
  { key: 'DUPLICATE', value: CardRelationKinds.DUPLICATE },
];
