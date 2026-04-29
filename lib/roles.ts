import type { UserRole } from '@/lib/data/types'

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'editor':
      return 'Editor'
    default:
      return 'Usuario'
  }
}

export function getRoleDescription(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'Gestiona usuarios, noticias, jugadores y partidos desde el panel admin.'
    case 'editor':
      return 'Puede crear noticias y actualizar la cobertura.'
    default:
      return 'Puede participar de la trivia y administrar su perfil.'
  }
}

export function canAccessEditor(role: UserRole) {
  return role === 'editor'
}

export function canAccessAdmin(role: UserRole) {
  return role === 'admin'
}

export function getRoleBadgeClass(role: UserRole) {
  switch (role) {
    case 'admin':
      return 'border-primary/30 bg-primary/10 text-primary'
    case 'editor':
      return 'border-foreground/10 bg-foreground/5 text-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}
