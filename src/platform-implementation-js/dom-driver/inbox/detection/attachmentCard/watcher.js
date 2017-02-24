/* @flow */

import _ from 'lodash';
import Kefir from 'kefir';
import Logger from '../../../../lib/logger';
import type ItemWithLifetimePool from '../../../../lib/ItemWithLifetimePool';
import type {ElementWithLifetime} from '../../../../lib/dom/make-element-child-stream';
import selectorStream from '../../../../lib/dom/selectorStream';

export default function watcher(
  root: Document=document,
  topRowElPool: ItemWithLifetimePool<*>,
  threadRowElPool: ItemWithLifetimePool<*>,
  messageElPool: ItemWithLifetimePool<*>
): Kefir.Observable<ElementWithLifetime> {
  const topRowElStream: Kefir.Observable<ElementWithLifetime> = topRowElPool.items();
  const threadRowElStream: Kefir.Observable<ElementWithLifetime> = threadRowElPool.items();
  const messageElStream: Kefir.Observable<ElementWithLifetime> = messageElPool.items();

  const messageCardSelector = selectorStream([
    '*',
    '*',
    'section',
    '*',
    {$filter: el => el.style.display !== 'none'},
    '*'
  ]);

  const messageCards = messageElStream
    .flatMap(({el,removalStream}) => messageCardSelector(el).takeUntilBy(removalStream));

  const listCardSelector = selectorStream([
    '*',
    '[jsaction]',
    '[role=list][jsaction]',
    '*',
    '[role=listitem]',
    {$watch: '[tabindex]'}
  ]);

  const listCards = Kefir.merge([
    topRowElStream.filter(({el}) => !/#gmail:thread-/.test(el.getAttribute('data-item-id')||'')),
    threadRowElStream
  ])
    .flatMap(({el,removalStream}) => listCardSelector(el).takeUntilBy(removalStream));

  return messageCards.merge(listCards)
    .filter(({el}) =>
      el.nodeName === 'DIV' && el.hasAttribute('tabindex') &&
      el.style.display !== 'none'
    );
}
