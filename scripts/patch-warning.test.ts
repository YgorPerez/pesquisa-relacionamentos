// `node --test "scripts/*.test.ts"`, from the root.

import assert from 'node:assert/strict'
import { describe, it } from 'vite-plus/test'
import { patchWarning, scriptWrites } from './patch-warning.ts'

describe('scriptWrites', () => {
  it('finds Python that opens a repository file for writing', () => {
    const command = `python3 - <<'EOF'
p='estudos/a.md'
s=open(p).read()
open(p,'w').write(s)
EOF`
    assert.deepEqual(scriptWrites(command), ['estudos/a.md'])
  })

  it('a variable with no known value shows up by name', () => {
    assert.deepEqual(
      scriptWrites(`python3 - <<'EOF'\nimport sys\nopen(sys.argv[1],'w')\nEOF`),
      ['sys.argv[1]'],
    )
  })

  it('finds sed -i on a file', () => {
    assert.deepEqual(scriptWrites("sed -i 's/a/b/' estudos/joel.md"), [
      'estudos/joel.md',
    ])
    assert.deepEqual(scriptWrites('sed -i s/a/b/ README.md'), ['README.md'])
    assert.deepEqual(
      scriptWrites("cd x && sed -i -e 's/a/b/' -e 's/c/d/' a.md b.md"),
      ['a.md', 'b.md'],
    )
  })

  it('what only reads, or writes to /tmp, passes without a warning', () => {
    assert.deepEqual(
      scriptWrites(
        `python3 -c "import json; print(json.load(open('x.json')))"`,
      ),
      [],
    )
    assert.deepEqual(
      scriptWrites(
        `python3 - <<'EOF'\nopen('/tmp/body.md','w').write('x')\nEOF`,
      ),
      [],
    )
    assert.deepEqual(
      scriptWrites(
        `python3 - <<'EOF'\np='/tmp/map.md'; s=open(p).read()\nopen(p,'w').write(s)\nEOF`,
      ),
      [],
    )
    assert.deepEqual(scriptWrites('sed -n 1,20p scripts/a.ts'), [])
    assert.deepEqual(scriptWrites('git status --short'), [])
  })

  it('sed -i quoted in a message or an echo is not a patch (festival-macacos#1432)', () => {
    assert.deepEqual(
      scriptWrites(
        'git commit -m "warn on Python or sed -i\n\nCo-Authored-By: Claude Opus 5.5"',
      ),
      [],
    )
    assert.deepEqual(scriptWrites('echo "test: sed -i s/a/b/ x.md"'), [])
    assert.deepEqual(
      scriptWrites(
        `cat > /tmp/issue.md <<'EOF'\nsed -i 's/a/b/' x.md\nopen(p, 'w')\nEOF`,
      ),
      [],
    )
  })
})

describe('patchWarning', () => {
  it('points to the Edit tool', () => {
    assert.match(
      patchWarning("sed -i 's/a/b/' GLOSSARY.md") ?? '',
      /the Edit tool/,
    )
  })

  it('nothing to say: null', () => {
    assert.equal(patchWarning('ls'), null)
  })
})
