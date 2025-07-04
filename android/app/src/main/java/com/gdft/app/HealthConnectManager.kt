class HealthConnectManager(private val context: Context) {
    private val client by lazy { HealthConnectClient.getOrCreate(context) }

    private val permissions = setOf(
        Permission.createReadPermission(ExerciseSessionRecord::class),
        Permission.createReadPermission(HeartRateRecord::class),
        Permission.createReadPermission(StepsRecord::class),
        Permission.createReadPermission(TotalCaloriesBurnedRecord::class),
        Permission.createReadPermission(DistanceRecord::class)
    )

    suspend fun checkPermissions(): Boolean {
        return try {
            val granted = client.permissionController.getGrantedPermissions()
            permissions.all { it in granted }
        } catch (e: Exception) {
            false
        }
    }

    suspend fun requestPermissions() {
        try {
            client.permissionController.requestPermissions(permissions)
        } catch (e: Exception) {
            // Handle exceptions
        }
    }

    suspend fun pullWorkouts(startTime: Instant, endTime: Instant): List<WorkoutData> {
        val sessions = client.readRecords(
            ReadRecordsRequest(
                recordType = ExerciseSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )
        )

        return sessions.records.map { session ->
            val heartRateStats = getHeartRateStats(session.startTime, session.endTime)
            val distance = session.totalDistance?.inKilometers
            val speed = distance?.let { dist ->
                val durationHours = Duration.between(session.startTime, session.endTime).seconds / 3600.0
                dist / durationHours
            }

            WorkoutData(
                calories = session.totalEnergyBurned?.inCalories ?: 0.0,
                avgHeartRate = heartRateStats.first,
                maxHeartRate = heartRateStats.second,
                duration = Duration.between(session.startTime, session.endTime).toMillis(),
                distance = distance,
                avgSpeed = speed,
                source = if (session.metadata.dataOrigin.packageName.contains("samsung")) 
                    "samsung_health" else "google_fit",
                startTime = session.startTime.toString(),
                endTime = session.endTime.toString()
            )
        }
    }

    private suspend fun getHeartRateStats(start: Instant, end: Instant): Pair<Double, Double> {
        val heartRates = client.readRecords(
            ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(start, end)
            )
        )

        val rates = heartRates.records.flatMap { it.samples }.map { it.beatsPerMinute }
        return if (rates.isEmpty()) Pair(0.0, 0.0)
        else Pair(rates.average(), rates.maxOrNull()?.toDouble() ?: 0.0)
    }
}