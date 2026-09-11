"""Windows compatibility shim.

g2pkk (a MeloTTS Korean g2p dependency) hard-imports a module named
`eunjeon` when `platform.system() == "Windows"` (see g2pkk/g2pkk.py
`get_mecab`). The real `eunjeon` package only ships prebuilt wheels for
Python 3.6 on PyPI, so it cannot be installed on any current Python on
Windows without a full MSVC build toolchain.

`python-mecab-ko` is an actively maintained MeCab-ko wrapper that DOES ship
real Windows wheels (cp38-cp312) and exposes the same `.pos(text)` method
g2pkk actually calls (see g2pkk/utils.py `annotate`). This shim just
re-exports it under the name `eunjeon.Mecab`, so `import eunjeon` succeeds
and behaves the same as it would on Linux/macOS with `python-mecab-ko`.

This directory must be on `sys.path` before `melo`/`g2pkk` is imported —
`server.py` does this at startup. Nothing else in this project should
import from this shim directly.
"""

from mecab import MeCab as Mecab

__all__ = ["Mecab"]
