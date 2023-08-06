import {
  extendTheme,
  theme as base,
} from '@chakra-ui/react'
// import type { StyleFunctionProps } from '@chakra-ui/styled-system'
// example theme
export const theme = extendTheme({
  // theme.ts (tsx file with usage of StyleFunctions, see 4.)
  colors: {
    brand: {
      '50': '#FFF5F5',
      '100': '#FED7D7',
      '200': '#FEB2B2',
      '300': '#FC8181',
      '400': '#F56565',
      '500': '#EC102A',
      '600': '#C53030',
      '700': '#9B2C2C',
      '800': '#822727',
      '900': '#63171B'
    }
  },
})
