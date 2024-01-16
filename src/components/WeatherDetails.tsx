import React from 'react'
import { FaRegEye } from "react-icons/fa";
import { ImMeter } from 'react-icons/im';
import { LuSunrise, LuSunset } from 'react-icons/lu';
import { MdAir } from 'react-icons/md';
import { PiDrop } from "react-icons/pi";

export interface WeatherDetailProps {
  visibility: string;
  humidity: string;
  windSpeed: string;
  airPressure: string;
  sunrise: string;
  sunset: string;
}

export default function WeatherDetails(props: WeatherDetailProps) {

  const {
    visibility = "25km",
    humidity = "61%",
    windSpeed = "7 km/h",
    airPressure = "1012 hPa",
    sunrise = "6.20",
    sunset = "18:48"
  } = props;

  return (
    <>
    <SingleWeatherDetail
    icon={<FaRegEye />}
    information='Visibility'
    value={visibility}
    />
    <SingleWeatherDetail
    icon={<PiDrop />}
    information='Humidity'
    value={humidity}
    />
    <SingleWeatherDetail
    icon={<MdAir />}
    information='Wind speed'
    value={windSpeed}
    />
    <SingleWeatherDetail
    icon={<ImMeter />}
    information='Air pressure'
    value={airPressure}
    />
    <SingleWeatherDetail
    icon={<LuSunrise />}
    information='Sunrise'
    value={sunrise}
    />
    <SingleWeatherDetail
    icon={<LuSunset />}
    information='Sunset'
    value={sunset}
    />
    </>
  )
}

export interface SingleWeatherDetailProps {
  information: string;
  icon: React.ReactNode;
  value: string;
}

function SingleWeatherDetail(props: SingleWeatherDetailProps){
  return (
    <div className='flex flex-col justify-between gap-2 items-center text-xs font-semibold text-black/80'>
      <p className='whitespace-nowrap'>{props.information}</p>
      <div className='text-3xl'>{props.icon}</div>
      <p>{props.value}</p>
    </div>
  )
}