class WebAppInterface(private val context: Context) {
    private val healthConnectManager = HealthConnectManager(context)
    private val scope = CoroutineScope(Dispatchers.Main + Job())

    @JavascriptInterface
    fun requestHealthConnectPermissions(callback: String) {
        scope.launch {
            try {
                healthConnectManager.requestPermissions()
                evaluateJavascript("window.Android.onPermissionResult(true, '$callback')")
            } catch (e: Exception) {
                evaluateJavascript("window.Android.onError('${e.message}', '$callback')")
            }
        }
    }

    @JavascriptInterface
    fun checkHealthConnectPermissions(callback: String) {
        scope.launch {
            try {
                val hasPermissions = healthConnectManager.checkPermissions()
                evaluateJavascript("window.Android.onPermissionResult($hasPermissions, '$callback')")
            } catch (e: Exception) {
                evaluateJavascript("window.Android.onError('${e.message}', '$callback')")
            }
        }
    }

    @JavascriptInterface
    fun pullSmartwatchWorkouts(startTime: String, endTime: String, callback: String) {
        scope.launch {
            try {
                val start = Instant.parse(startTime)
                val end = Instant.parse(endTime)
                val workouts = healthConnectManager.pullWorkouts(start, end)
                val workoutsJson = Gson().toJson(workouts)
                evaluateJavascript("window.Android.onWorkoutsPulled($workoutsJson, '$callback')")
            } catch (e: Exception) {
                evaluateJavascript("window.Android.onError('${e.message}', '$callback')")
            }
        }
    }
}