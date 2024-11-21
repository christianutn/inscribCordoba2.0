import React, { useState, useEffect } from "react";
import {getCategoriasChatbot} from "../services/categoriaChatbot.service.js"
import {getDiccionarioChatbot} from "../services/diccionarioChatbot.service.js"


const ChatBoot = ({ chatMessages }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState(chatMessages || []);

    const handleNewMessageChange = (e) => {
        setNewMessage(e.target.value);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;

        const newMessageObject = {
            side: 2, // Cambiar según la lógica del lado
            menssage: newMessage,
            imagen: null,
        };

        setMessages([...messages, newMessageObject]);
        setNewMessage("");
    };

    useEffect(() => {
        const textarea = document.getElementById("textAreaExample");
        if (textarea) {
            textarea.focus();
        }

        (
            async () => {
                const categorias = await getCategoriasChatbot();
                console.log("Categorias:", categorias);

                // Pruebas para traer datos desde la tabla diccionarioChatbot
                const datosDeDiccionariosChatbot = await getDiccionarioChatbot("", "")
                console.log("Diccionario de chatbot (Todos los datos): ", datosDeDiccionariosChatbot)

                // Filtrados por idCategoria
                const datosDeDiccionariosChatbotPorIdCategoria = await getDiccionarioChatbot("", 1)
                console.log("Diccionario de chatbot (Filtrado por idCategoria = 1): ", datosDeDiccionariosChatbotPorIdCategoria)

                //Filtrados por contenido de pregunta
                const datosDeDiccionariosChatbotPorPregunta = await getDiccionarioChatbot("cert", "")
                console.log("Diccionario de chatbot (Filtrado por pregunta -cert-): ", datosDeDiccionariosChatbotPorPregunta)

                //Filtrado combinado por pregunta e idCategoria
                //Filtrados por contenido de pregunta
                const datosDeDiccionariosChatbotPorPreguntaIdCategoria = await getDiccionarioChatbot("cert", "1")
                console.log("Diccionario de chatbot (Filtrado por pregunta -cert- y id = 1): ", datosDeDiccionariosChatbotPorPreguntaIdCategoria)




            }
        )();
    }, []);

    return (
        <section style={{ backgroundColor: "#eee" }}>
            <div className="container py-5 scrollable-div">
                <div className="row d-flex justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-4">
                        <div className="card" id="chat1" style={{ borderRadius: "15px" }}>
                            <div
                                className="card-header d-flex justify-content-between align-items-center p-3 bg-info text-white border-bottom-0"
                                style={{
                                    borderTopLeftRadius: "15px",
                                    borderTopRightRadius: "15px",
                                }}
                            >
                                <i className="fas fa-angle-left"></i>
                                <p className="mb-0 fw-bold">Asistencia Campus</p>
                                <i className="fas fa-times"></i>
                            </div>
                            <div className="card-body">
                                {messages.map((elemento, index) =>
                                    elemento.side === 1 ? (
                                        <div
                                            key={index}
                                            className="d-flex flex-row justify-content-start mb-4"
                                        >
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                                                alt="avatar 1"
                                                style={{ width: "45px", height: "100%" }}
                                            />
                                            <div
                                                className="p-3 ms-3"
                                                style={{
                                                    borderRadius: "15px",
                                                    backgroundColor: "rgba(57, 192, 237,.2)",
                                                }}
                                            >
                                                <p className="small mb-0">{elemento.menssage}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            key={index}
                                            className="d-flex flex-row justify-content-end mb-4"
                                        >
                                            <div
                                                className="p-3 me-3 border"
                                                style={{
                                                    borderRadius: "15px",
                                                    backgroundColor: "#fbfbfb",
                                                }}
                                            >
                                                <p className="small mb-0">
                                                    {elemento.menssage}
                                                    {elemento.imagen && (
                                                        <img
                                                            src={elemento.imagen}
                                                            alt="attachment"
                                                            style={{ maxWidth: "100%", marginTop: "10px" }}
                                                        />
                                                    )}
                                                </p>
                                            </div>
                                            <img
                                                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp"
                                                alt="avatar 2"
                                                style={{ width: "45px", height: "100%" }}
                                            />
                                        </div>
                                    )
                                )}

                                <div className="form-outline">
                                    <textarea
                                        className="form-control"
                                        id="textAreaExample"
                                        rows="4"
                                        value={newMessage}
                                        onChange={handleNewMessageChange}
                                    ></textarea>
                                    <label className="form-label" htmlFor="textAreaExample">
                                        Escribí tu pregunta
                                    </label>
                                </div>
                                <button
                                    id="btnPreguntar"
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    onClick={handleSendMessage}
                                    style={{ display: "block" }}
                                >
                                    Preguntar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChatBoot;
