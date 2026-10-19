// Antes do teste das stories (`src/platform/storybook/stories.navegador.test.tsx`):
// o preview do Storybook, com os estilos do site.
import { setProjectAnnotations } from '@storybook/react-vite'
import { beforeAll } from 'vite-plus/test'
import preview from './preview'

const anotacoes = setProjectAnnotations(preview)
beforeAll(anotacoes.beforeAll)
