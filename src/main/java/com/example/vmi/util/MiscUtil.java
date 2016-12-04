package com.example.vmi.util;

public class MiscUtil {

	public static int getWeekFromFilename(String filename){
		String week = filename.split("_")[1];
		
		return Integer.parseInt(week.replace("Week", ""));
	}
}
