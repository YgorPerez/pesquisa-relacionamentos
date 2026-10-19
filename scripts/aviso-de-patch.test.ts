// `node --test "scripts/*.test.ts"`, na raiz.

import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { aviso, escritasPorScript } from './aviso-de-patch.ts'

describe('escritasPorScript', () => {
  it('acha o Python que abre um arquivo do repositório para escrever', () => {
    const comando = `python3 - <<'EOF'
p='estudos/a.md'
s=open(p).read()
open(p,'w').write(s)
EOF`
    assert.deepEqual(escritasPorScript(comando), ['estudos/a.md'])
  })

  it('a variável sem valor conhecido aparece pelo nome', () => {
    assert.deepEqual(
      escritasPorScript(`python3 - <<'EOF'\nimport sys\nopen(sys.argv[1],'w')\nEOF`),
      ['sys.argv[1]'],
    )
  })

  it('acha o sed -i num arquivo', () => {
    assert.deepEqual(escritasPorScript("sed -i 's/a/b/' estudos/joel.md"), ['estudos/joel.md'])
    assert.deepEqual(escritasPorScript('sed -i s/a/b/ README.md'), ['README.md'])
    assert.deepEqual(escritasPorScript("cd x && sed -i -e 's/a/b/' -e 's/c/d/' a.md b.md"), [
      'a.md',
      'b.md',
    ])
  })

  it('o que só lê, ou escreve em /tmp, passa sem aviso', () => {
    assert.deepEqual(
      escritasPorScript(`python3 -c "import json; print(json.load(open('x.json')))"`),
      [],
    )
    assert.deepEqual(
      escritasPorScript(`python3 - <<'EOF'\nopen('/tmp/corpo.md','w').write('x')\nEOF`),
      [],
    )
    assert.deepEqual(
      escritasPorScript(`python3 - <<'EOF'\np='/tmp/map.md'; s=open(p).read()\nopen(p,'w').write(s)\nEOF`),
      [],
    )
    assert.deepEqual(escritasPorScript('sed -n 1,20p scripts/a.ts'), [])
    assert.deepEqual(escritasPorScript('git status --short'), [])
  })

  it('sed -i citado numa mensagem ou num echo não é patch (festival-macacos#1432)', () => {
    assert.deepEqual(
      escritasPorScript(
        'git commit -m "avisa por Python ou sed -i\n\nCo-Authored-By: Claude Opus 5.5"',
      ),
      [],
    )
    assert.deepEqual(escritasPorScript('echo "teste: sed -i s/a/b/ x.md"'), [])
    assert.deepEqual(
      escritasPorScript(`cat > /tmp/issue.md <<'EOF'\nsed -i 's/a/b/' x.md\nopen(p, 'w')\nEOF`),
      [],
    )
  })
})

describe('aviso', () => {
  it('aponta a ferramenta Edit', () => {
    assert.match(aviso("sed -i 's/a/b/' GLOSSARY.md") ?? '', /ferramenta Edit/)
  })

  it('nada a dizer: null', () => {
    assert.equal(aviso('ls'), null)
  })
})
