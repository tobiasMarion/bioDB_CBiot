import { useEffect } from 'react'

const APP_NAME = 'Biological Sample Database | CBiot - UFRGS'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME
    return () => {
      document.title = APP_NAME
    }
  }, [title])
}
