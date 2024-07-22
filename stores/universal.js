export const useUniversal = () => {
  // 中華一餅line
  const onMessengerClick = () => {
    window.open('https://line.me/R/ti/p/@chinabing', '_blank')
  }
  //   google表單1
  const onForm1Click = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSf-SKgtwQNMay9rAhWf69mY5UToJ3RJHdSq1oEFnxknJJZPWg/viewform', '_blank')
  }
  //   google表單2
  const onForm2Click = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSeFG647mYLOXp_rnbIdRyfOKmtlOzjFE44cqjI02wm0Ktu1cA/viewform', '_blank')
  }
  //   華餅ig
  const onMessengerIg = () => {
    window.open('https://www.instagram.com/direct/t/17849567573937285', '_blank')
  }
  //   華餅FB
  const onMessengerFB = () => {
    window.open('https://www.facebook.com/chinese.lumpia/?locale=zh_TW', '_blank')
  }
  //   運費
  const onMessengerFreight = () => {
    window.open('https://ppt.cc/fpHdAx', '_blank')
  }
  //   打電話
  const dialNumber = () => {
    window.location.href = 'tel:0223015331'
  }
  //   訂單
  const onDownloadClick = () => {
    window.open('/menu.pdf', '_blank')
  }
  return {
    onMessengerClick,
    onForm1Click,
    onForm2Click,
    onMessengerIg,
    dialNumber,
    onMessengerFB,
    onDownloadClick,
    onMessengerFreight
  }
}
