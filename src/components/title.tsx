type TitleProps = {
  title: string
  description: string
}

function Title({ title, description }: TitleProps) {
  return (
    <div className="flex flex-col items-start gap-1">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-foreground-600">{description}</p>
    </div>
  )
}

export default Title
