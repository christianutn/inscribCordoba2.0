

const URL = "http://localhost:4000/api/ministerios";


export const getMinisterios = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`}
        });

        
        if(response.status !== 200){

            const error = new Error("No existen ministerios");
            error.statusCode = 404;
            throw error;
        }
        const data = await response.json()
        console.log("Daata:",data)

        return data
    } catch (error) {
        
        throw error
    }
}