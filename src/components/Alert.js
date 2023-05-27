export function Alert({message}){
    return <div className="bg-red-200 text-red-500 px-4 py-3 rounded relative mb-2 text-center mt-2">
        <span className="sm:inline block">{message}</span>

    </div>
}