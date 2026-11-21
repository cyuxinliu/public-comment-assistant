import type { AnswerStatus, SearchScope } from '../src/types'

/**
 * Test questions for Component 3, run against the PAL50 case.
 *
 * origin:
 * - "rule-check": written by the team to exercise one AGENTS.md rule. Must always pass.
 * - "advocate":   asked by a real advocate (e.g., Terry's session), recorded verbatim.
 *                 Add these as you collect them. Write the expectations from the
 *                 records after collecting the question, not before.
 */
export interface EvalCase {
  id: string
  origin: 'rule-check' | 'advocate'
  question: string
  scope: SearchScope
  /** Any of these statuses passes. */
  status: AnswerStatus[]
  /** Each inner list: at least one of these "sourceId/passageId" must be cited. */
  mustCite?: string[][]
  /** Patterns that must appear in answer + missingInfo + clarifyingQuestion. */
  mustSay?: RegExp[]
  /** Patterns that must never appear there. */
  mustNotSay?: RegExp[]
  why: string
}

export const PERMIT_ID = 'exxonmobil-beaumont-pal50-renewal'

export const CASES: EvalCase[] = [
  {
    id: 'nox-permit', origin: 'rule-check', scope: 'permit',
    question: 'Would this renewal let the refinery emit more nitrogen oxides?',
    status: ['answered'],
    mustCite: [['src-technical/t1', 'src-technical/t2']],
    mustSay: [/2,?088\.19/],
    why: 'Check-in demo question (AGENTS.md).',
  },
  {
    id: 'nox-both', origin: 'rule-check', scope: 'both',
    question: 'Would this renewal let the refinery emit more nitrogen oxides?',
    status: ['answered'],
    mustCite: [['src-technical/t1', 'src-technical/t2']],
    why: 'Demo question with every document selected.',
  },
  {
    id: 'nox-history-only', origin: 'rule-check', scope: 'facility_history',
    question: 'Would this renewal let the refinery emit more nitrogen oxides?',
    status: ['insufficient_evidence', 'no_evidence', 'needs_clarification'],
    mustSay: [/this permit|both/i],
    why: 'History records cannot show what the renewal authorizes; point to the right scope.',
  },
  {
    id: 'deadline', origin: 'rule-check', scope: 'permit',
    question: 'When is the deadline to submit a public comment?',
    status: ['answered', 'insufficient_evidence', 'no_evidence'],
    mustSay: [/not (been )?(verified|stated|specified|given|listed|provided)|unverified|no (specific |calendar |exact )?(date|deadline)|doesn.t (state|give|list)|does not (state|give|list)|30 days/i],
    mustNotSay: [/December 19/i, /deadline (is|was) March 31/i, /2036.{0,40}deadline|deadline.{0,40}2036/i],
    why: 'Relative windows, issuance, decision, and expiration dates are not comment deadlines.',
  },
  {
    id: 'still-comment', origin: 'rule-check', scope: 'permit',
    question: 'Can I still submit a comment on this renewal?',
    status: ['answered', 'insufficient_evidence'],
    mustCite: [['src-final-action/f1']],
    why: 'Comment status comes from the official final action.',
  },
  {
    id: 'reported-vs-limit', origin: 'rule-check', scope: 'both',
    question: 'Has the refinery actually emitted more NOx than its limit allows?',
    status: ['answered', 'insufficient_evidence'],
    mustCite: [['src-history/h2'], ['src-technical/t2', 'src-technical/t3']],
    mustSay: [/1,?635\.62/, /2,?088\.19/],
    why: 'Reported emissions and permitted limits must both appear and stay separate.',
  },
  {
    id: 'reported-wrong-scope', origin: 'rule-check', scope: 'permit',
    question: 'What NOx emissions did the facility report in 2019?',
    status: ['no_evidence', 'needs_clarification', 'insufficient_evidence'],
    mustSay: [/facility history|both/i],
    mustNotSay: [/1,?635\.62/],
    why: 'Question targets history while only permit documents are selected.',
  },
  {
    id: 'violations', origin: 'rule-check', scope: 'facility_history',
    question: 'Has this facility had any violations?',
    status: ['answered', 'insufficient_evidence'],
    mustCite: [['src-history/h1']],
    mustSay: [/investigation|report/i],
    why: 'The no-violations finding covers one report review, not the full history.',
  },
  {
    id: 'residents', origin: 'rule-check', scope: 'both',
    question: 'What have community members said about the refinery?',
    status: ['answered', 'insufficient_evidence'],
    mustCite: [['src-community/c1', 'src-community/c2']],
    mustSay: [/Malveaux/i, /2017|earlier|expansion|not .{0,30}(PAL50|this renewal)/i],
    why: 'Attribute the viewpoint and keep it as historical context.',
  },
  {
    id: 'voc-limit', origin: 'rule-check', scope: 'permit',
    question: 'What is the proposed limit for volatile organic compounds?',
    status: ['answered'],
    mustCite: [['src-technical/t4']],
    mustSay: [/2,?749\.22/],
    why: 'Numeric answers must cite the passage with the number.',
  },
  {
    id: 'expiration', origin: 'rule-check', scope: 'permit',
    question: 'When does the renewed permit expire?',
    status: ['answered'],
    mustCite: [['src-final-action/f2']],
    mustSay: [/March 31, 2036/],
    why: 'Simple fact lookup.',
  },
  {
    id: 'benzene', origin: 'rule-check', scope: 'both',
    question: 'How much benzene does the refinery emit?',
    status: ['no_evidence', 'insufficient_evidence'],
    why: 'Not in the records: say what is missing instead of guessing.',
  },
  {
    id: 'cumulative', origin: 'rule-check', scope: 'both',
    question: 'How do the refinery’s emissions add up with other plants nearby?',
    status: ['no_evidence', 'insufficient_evidence'],
    why: 'Modeled on Terry’s combined-effects question; the records do not cover other plants.',
  },
  {
    id: 'vague', origin: 'rule-check', scope: 'both',
    question: 'Is it bad?',
    status: ['needs_clarification'],
    why: 'Ambiguous question.',
  },
]
