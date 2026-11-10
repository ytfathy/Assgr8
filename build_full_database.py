# -*- coding: utf-8 -*-
import json

qs = []

def add_q(id, page, unit_id, unit_t, lesson_id, lesson_t, week_num, week_t, section, skill, q_type, prompt, corr, expl, diff='متوسط', crop=None, sub=None, opts=None, accepts=None, rule=None):
    q = {
        'id': id,
        'sourcePage': page,
        'unitId': unit_id,
        'unitTitle': unit_t,
        'lessonId': lesson_id,
        'lessonTitle': lesson_t,
        'weekNumber': week_num,
        'weekTitle': week_t,
        'section': section,
        'skillCategory': skill,
        'questionType': q_type,
        'prompt': prompt,
        'correctAnswer': corr,
        'explanation': expl,
        'difficulty': diff
    }
    if crop: q['pageCrop'] = crop
    if sub: q['subPrompt'] = sub
    if opts: q['options'] = opts
    if accepts: q['acceptableAnswers'] = accepts
    if rule: q['learningRule'] = rule
    qs.append(q)

print('Initialized builder function')
