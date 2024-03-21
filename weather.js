import 'dotenv/config'
/**
 *  Getting weather information.
 */
export async function getWeather(city) {
  const apiKey = process.env.WEAHER_API_KEY
  console.log(process.env.WEAHER_API_KEY)
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message)
  }
  return data
}
