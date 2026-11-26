import assert from 'node:assert/strict';
import test from 'node:test';
import { ipaToKokoro } from '../src/kokoro.js';
import { parseIPA, planSpeech, respell, synthesize } from '../src/speech.js';

const plan = ipa => planSpeech(parseIPA(ipa));
const vowels = speech => speech.events.filter(event => event.kind === 'V');

test('moving the stress mark moves emphasis while preserving the three vowels', () => {
  const baseline = plan('pa.ta.ka');
  for (const [i, [ipa, neural, system]] of [
    ['/ˈpa.ta.ka/', 'pˈataka', 'pátaca'],
    ['/paˈta.ka/', 'patˈaka', 'patáca'],
    ['/pa.taˈka/', 'patakˈa', 'patacá'],
  ].entries()) {
    for (const mark of ['ˈ', "'", '’']) {
      const input = ipa.replace('ˈ', mark);
      assert.deepEqual(ipaToKokoro(input), { text: neural, subs: [], dropped: [] });
      assert.equal(respell(input), system);
      const events = vowels(plan(input));
      assert.deepEqual(events.map(e => e.seg), ['a', 'a', 'a']);
      assert.deepEqual(events.map(e => e.stress), events.map((_, j) => j === i));
      assert.ok(events[i].dur > vowels(baseline)[i].dur);
      assert.ok(events[i].AV > vowels(baseline)[i].AV);
    }
  }
});

test('onsets, vowel length, nasalization, tone and ejectives preserve stress placement', () => {
  assert.equal(ipaToKokoro("/'a.la ˈstraː.ta ka˥'tʼã/").text, 'ˈala strˈaːta ka→tʔˈa\u0303');
  assert.equal(ipaToKokoro('ˈk t.a').text, 'k ta');
  assert.deepEqual(vowels(plan("'ɐ.ta")).map(e => e.stress), [true, false]);
  assert.deepEqual(vowels(plan("'k ta")).map(e => e.stress), [false]);
});

test('nasal vowels keep their oral formants and add nasal resonance in the built-in reader', () => {
  assert.deepEqual(parseIPA('/ˈkãː/'), [{ seg: 'k', stress: false }, { seg: 'ã', stress: true, long: true }]);
  const nasal = plan('/ˈkɛ̃ː/');
  const oral = plan('/ˈkɛː/');
  const [v] = vowels(nasal);
  assert.equal(v.seg, 'ɛ̃');
  assert.deepEqual(v.F, vowels(oral)[0].F);
  assert.equal(v.dur, vowels(oral)[0].dur);
  assert.ok(v.nasalZero > 0);
  const samples = synthesize(nasal);
  assert.ok(samples.every(Number.isFinite));
  assert.notDeepEqual(samples, synthesize(oral));
  assert.equal(ipaToKokoro('/ˈkɛ̃ː/').text, 'kˈɛ̃ː');
});

test('the built-in reader synthesizes stressed near-high and front-rounded vowels distinctly from schwa', () => {
  const schwa = vowels(plan('ˈkə.ta'))[0];
  for (const vowel of ['ɪ', 'ʏ', 'ʊ', 'œ']) {
    const speech = plan('ˈk' + vowel + '.ta');
    const first = vowels(speech)[0];
    assert.equal(first.seg, vowel);
    assert.equal(first.stress, true);
    assert.notDeepEqual(first.F, schwa.F);
    const audio = synthesize(speech);
    assert.ok(audio.every(Number.isFinite) && audio.some(s => Math.abs(s) > 0.01));
  }
});

test('ø stays a single rounded vowel with its own stress and length', () => {
  const ipa = "/pe 'pøː pœ po/";
  // Older callers requested this approximation for non-French blends.
  assert.equal(ipaToKokoro(ipa, { frontRounded: 'approx' }).text, 'pe pˈøː pœ po');
  const [e, rounded, openRounded, o] = vowels(plan(ipa));
  assert.equal(rounded.seg, 'ø');
  assert.ok(rounded.stress);
  assert.ok(rounded.F[1] < e.F[1] && rounded.F[1] > o.F[1]);
  assert.ok(rounded.F[0] < openRounded.F[0]);
  assert.ok(rounded.dur > vowels(plan('/ˈpø/'))[0].dur);
  assert.equal(respell(ipa), null);
  assert.equal(respell('/ˈpe.u/'), 'péu');
});
