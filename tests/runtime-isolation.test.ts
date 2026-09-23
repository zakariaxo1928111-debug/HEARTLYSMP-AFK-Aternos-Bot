import test from 'node:test'; import assert from 'node:assert/strict'; import { RuntimeRegistry } from '../src/lib/bot-runtime';
test('runtime registry isolates bot ids',()=>{const r=new RuntimeRegistry(); assert.equal(r.get('a'),undefined); assert.equal(r.size,0);});
