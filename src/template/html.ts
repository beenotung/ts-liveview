export class HTMLTemplate<Keys extends string> {
  constructor(public template: string) {}

  toHTML(options: Record<Keys, string>): string {
    let acc = this.template
    for (const [key, value] of Object.entries(options)) {
      acc = acc.replace(`{${key}}`, value as string)
    }
    return acc
  }
}
