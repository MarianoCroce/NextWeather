'use client'

import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { useQuery } from 'react-query';
import axios from 'axios';
import { format, fromUnixTime, parseISO } from 'date-fns';
import Container from '@/components/Container';
import { convertKelvinToCelcius } from '@/utils/convertKelvinToCelcius';
import WeatherIcon from '@/components/WeatherIcon';
import { getDayOrNightIcon } from '@/utils/getDayOrNightIcon';
import WeatherDetails from '@/components/WeatherDetails';
import { metersToKilometers } from '@/utils/metersToKilometers';
import { convertWindSpeed } from '@/utils/convertWindSpeed';
import ForecastWeatherDetail from '@/components/ForecastWeatherDetail';
import { loadingCityAtom, placeAtom } from './atom';
import { useAtom } from 'jotai';
import { useEffect } from 'react';


//https://api.openweathermap.org/data/2.5/forecast?q=LaPlata&appid=afe1ae263bc9d5331b93a2ed8ffaa370&cnt=56

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherEntry[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface WeatherEntry {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string;
    }
  ];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}


export default function Home() {
  const [place, setPlace] = useAtom(placeAtom)
  const [loadingCity, setLoadingCity ] = useAtom(loadingCityAtom)

  const { isLoading, error, data, refetch } = useQuery<WeatherData>('repoData', async () => {
    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`);

    return data;
  }
  );

  useEffect(()=> {
  refetch()
  }, [place, refetch])

  const firstData = data?.list[0]

  

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  //Filtering data
  const firstDataForEachDate = uniqueDates.map((date) =>{
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    })
  })



  if (isLoading) return (
    <div className='flex items-center min-h-screen justify-center'>
      <p className='animate-bounce'>Loading...</p>
    </div>
  )

  return (
    <div className='flex flex-col gap-4 bg-gray-100 min-h-screen'>
      <Navbar location={data?.city.name}/>
      <main className='px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4'>

        {/* Today */}
        {loadingCity ? (<WeatherSkeleton/>) : (
        <>
        <section className='space-y-4'>
          <div className='space-y-2'>
            <h2 className='flex gap-1 text-2xl items-end'>
              <p> {format(parseISO(firstData?.dt_txt ?? ''), 'EEEE')} </p>
              <p className='text-lg'>({format(parseISO(firstData?.dt_txt ?? ''), "dd.MM.yyyy")})</p>
            </h2>
            <Container className='gap-10 px-65 items-center'>
              {/* temperature */}
              <div className='flex flex-col px-4'>
                <span className='text-5xl'>
                  {convertKelvinToCelcius(firstData?.main.temp ?? 0)}º
                </span>
                <p className='text-xs space-x-1 whitespace-nowrap'>
                  <span> Feels like</span>
                  <span>
                    {convertKelvinToCelcius(firstData?.main.feels_like ?? 0)}º
                  </span>
                </p>
                <p className='text-xs space-x-2'>

                  <span >
                    {convertKelvinToCelcius(firstData?.main.temp_min ?? 0)}º↓{" "}
                  </span>

                  <span >
                    {" "}
                    {convertKelvinToCelcius(firstData?.main.temp_max ?? 0)}º↑
                  </span>

                </p>
              </div>
              {/* time and weather icon */}
              <div className='flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3'>

                {data?.list.map((data, index)=>
                <div key={index} className='flex flex-col justify-between gap-2 items-center text-xs font-semibold'>

                  <p className='whitespace-nowrap'>
                    {format(parseISO(data.dt_txt),'h:mm a')}
                  </p>
                  {/* <WeatherIcon iconName={data.weather[0].icon}/> */}
                  <WeatherIcon iconName={getDayOrNightIcon(data.weather[0].icon, data.dt_txt)}/>
                  <p>{convertKelvinToCelcius(data?.main.temp ?? 0)}º</p>

                </div>
                )}
              </div>
            </Container>
          </div>
          <div className='flex gap-4'>
            {/* left */}
            <Container className='w-fit justify-center flex-col px-4 items-center'>

              <p className='capitalize text-center'>{firstData?.weather[0].description}</p>
              <WeatherIcon iconName={getDayOrNightIcon(firstData?.weather[0].icon ?? "", firstData?.dt_txt ?? "")}/>

            </Container>
            <Container className='bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto'>
            <WeatherDetails 
            visibility={metersToKilometers(firstData?.visibility ?? 10000)} 
            humidity={`${firstData?.main.humidity}%`}
            windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}  
            airPressure={`${firstData?.main.pressure} hPa`}
            sunrise={format(fromUnixTime(data?.city.sunrise ?? 1705222350),
              "H:mm"
              )}
            sunset={format(fromUnixTime(data?.city.sunset ?? 1705273706),
              "H:mm"
              )}  
            />
              
            </Container>      
            {/* right */}
              

          </div>
        </section>

        {/* 7 days */}
        <section className='flex w-full flex-col gap-4'>
          <p className='text-2xl'>Forecast (7 days)</p>
          {firstDataForEachDate.map((d, i) =>(

            <ForecastWeatherDetail 
            key={i}
            description={d?.weather[0].description ?? ""}
            weatherIcon={d?.weather[0].icon ?? "01d"}
            date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
            day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
            feels_like={d?.main.feels_like ?? 0}
            temp={d?.main.temp ?? 0}
            temp_max={d?.main.temp_max ?? 0}
            temp_min={d?.main.temp_min ?? 0}
            airPressure={`${d?.main.pressure} hPa`}
            humidity={`${d?.main.humidity}%`}
            sunrise={format(fromUnixTime(data?.city.sunrise ?? 1705222350), "H:mm")}
            sunset={format(fromUnixTime(data?.city.sunset ?? 1705273706), "H:mm")}
            visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
            windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}
            />    
            ))}
        </section>
        </>)}
      </main>
    </div>
  )
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8">
      {/*today's data skeleton */}
      <div className='space-y-2 animate-pulse'>
        {/*date skeleton */}
        <div className='flex gap-1 text-2xl items-end'>
          <div className='h-6 w-24 bg-gray-300 rounded'></div>
          <div className='h-6 w-24 bg-gray-300 rounded'></div>
        </div>

        {/*time wise temperature skeleton */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className='flex flex-col items-center space-y-2'>
            <div className='h-6 w-16 bg-gray-300 rounded'></div>
            <div className='h-6 w-6 bg-gray-300 rounded-full'></div>
            <div className='h-6 w-16 bg-gray-300 rounded'></div>
          </div>
        ))}
        </div>
      </div>

      {/*7 days forecast skeleton */}
      <div className='flex flex-col gap-4 animate-pulse'>
        <p className='text-2xl h-8 w-36 bg-gray-300 rounded'></p>

         {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='h-8 w-28 bg-gray-300 rounded'></div>
            <div className='h-10 w-10 bg-gray-300 rounded-full'></div>
            <div className='h-8 w-28 bg-gray-300 rounded'></div>
            <div className='h-8 w-28 bg-gray-300 rounded'></div>
          </div>
         ))} 

      </div>

    </section>
  )
}