# [CMM patch] 언어 모듈을 모듈 최상단에서 전부 즉시 import하지 않고, 실제로 쓰는
# 언어만 필요할 때 import하도록 바꿨다. 원본은 `from . import chinese, japanese, ...`
# 을 파일 맨 위에서 실행해, 한국어(KR)만 쓰더라도 japanese.py가 로드되며 그 안의
# `import MeCab`(→ fugashi 필요)이 무조건 실행됐다. CMM 배포는 한국어만 쓰므로
# japanese.py를 아예 로드하지 않게 해 fugashi/MeCab 의존성 자체를 없앤다.
# (동작은 그대로 — import 시점만 늦췄다. 다른 언어를 실제로 요청하면 그때 로드된다.)
from . import cleaned_text_to_sequence
import copy

_LANGUAGE_MODULE_NAMES = {
    "ZH": "chinese",
    "JP": "japanese",
    "EN": "english",
    "ZH_MIX_EN": "chinese_mix",
    "KR": "korean",
    "FR": "french",
    "SP": "spanish",
    "ES": "spanish",
}
_language_module_cache = {}


def _get_language_module(language):
    if language not in _LANGUAGE_MODULE_NAMES:
        raise ValueError(f"지원하지 않는 언어입니다: {language}")
    if language not in _language_module_cache:
        import importlib

        module_name = _LANGUAGE_MODULE_NAMES[language]
        _language_module_cache[language] = importlib.import_module(f".{module_name}", __package__)
    return _language_module_cache[language]


def clean_text(text, language):
    language_module = _get_language_module(language)
    norm_text = language_module.text_normalize(text)
    phones, tones, word2ph = language_module.g2p(norm_text)
    return norm_text, phones, tones, word2ph


def clean_text_bert(text, language, device=None):
    language_module = _get_language_module(language)
    norm_text = language_module.text_normalize(text)
    phones, tones, word2ph = language_module.g2p(norm_text)

    word2ph_bak = copy.deepcopy(word2ph)
    for i in range(len(word2ph)):
        word2ph[i] = word2ph[i] * 2
    word2ph[0] += 1
    bert = language_module.get_bert_feature(norm_text, word2ph, device=device)

    return norm_text, phones, tones, word2ph_bak, bert


def text_to_sequence(text, language):
    norm_text, phones, tones, word2ph = clean_text(text, language)
    return cleaned_text_to_sequence(phones, tones, language)


if __name__ == "__main__":
    pass
